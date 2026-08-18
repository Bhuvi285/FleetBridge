package com.fleetbridge.trip.infrastructure.kafka;

import com.fleetbridge.trip.infrastructure.outbox.OutboxEvent;
import com.fleetbridge.trip.infrastructure.outbox.OutboxEventRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class OutboxRelayScheduler {

    private final OutboxEventRepository outboxEventRepository;
    private final KafkaTemplate<String, String> kafkaTemplate;

    @Scheduled(fixedDelay = 5000)
    @Transactional
    public void relayEvents() {
        List<OutboxEvent> events = outboxEventRepository.findByProcessedFalseOrderByCreatedAtAsc();

        for (OutboxEvent event : events) {
            try {
                // Topic name depends on aggregate/event type. Hardcoding for now based on plan.
                String topic = "trip-events";
                kafkaTemplate.send(topic, event.getAggregateId(), event.getPayload())
                    .whenComplete((result, ex) -> {
                        if (ex == null) {
                            log.debug("Sent event {} to topic {}", event.getId(), topic);
                        } else {
                            log.error("Failed to send event {} to topic {}", event.getId(), topic, ex);
                        }
                    });

                // Mark as processed
                event.setProcessed(true);
                outboxEventRepository.save(event);
            } catch (Exception e) {
                log.error("Error processing outbox event: {}", event.getId(), e);
                // Break to preserve ordering and not overwhelm broker if it's down
                break;
            }
        }
    }
}
